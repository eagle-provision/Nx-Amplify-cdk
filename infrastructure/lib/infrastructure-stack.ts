import { CfnOutput, SecretValue, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import * as cr from 'aws-cdk-lib/custom-resources'
import {
  App,
  GitHubSourceCodeProvider,
  RedirectStatus,
} from '@aws-cdk/aws-amplify-alpha'
import { CfnBranch } from 'aws-cdk-lib/aws-amplify'

interface HostingStackProps extends StackProps {
  readonly owner: string
  readonly repository: string
  readonly githubOauthTokenName: string
  readonly environmentVariables?: { [name: string]: string }
}

export class AmplifyHostingStack extends Stack {
  constructor(scope: Construct, id: string, props: HostingStackProps) {
    super(scope, id, props)

    const amplifyApp = new App(this, 'Sample', {
      appName: 'NextJs Sample',
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: props.owner,
        repository: props.repository,
        oauthToken: SecretValue.unsafePlainText(props.githubOauthTokenName),
      }),
      autoBranchDeletion: true,
      customRules: [
        {
          source: '/<*>',
          target: '	/index.html',
          status: RedirectStatus.NOT_FOUND_REWRITE,
        },
      ],
      // needed for monorepo structure
      environmentVariables: { "AMPLIFY_MONOREPO_APP_ROOT": "app", "AMPLIFY_DIFF_DEPLOY": "false" },
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: '1.0',
        // needed for monorepo structure
        // https://docs.aws.amazon.com/amplify/latest/userguide/monorepo-configuration.html
        applications: [
          {
            appRoot: 'app',
            frontend: {
              phases: {
                preBuild: {
                  commands: ['npm ci'],
                },
                build: {
                  commands: ['npm run build', "pwd", "ls -all"],
                },
              },
              artifacts: {
                baseDirectory: '.next',
                files: ['**/*'],
              },
              cache: {
                paths: ['node_modules/**/*'],
              },
            },
          }
        ]
      }),
    })

    const main = amplifyApp.addBranch('main', {
      stage: 'PRODUCTION',
      autoBuild: true,
    })
    // add framework manually because it is not yet supported by the Amplify CDK
    // https://github.com/aws/aws-cdk/issues/23325
    const cfnBranch = main.node.defaultChild as CfnBranch
    cfnBranch.addOverride('Properties.Framework', 'Next.js - SSR');
    // cfnBranch.addDeletionOverride('Properties.BranchName');

    // update platform to WEB_COMPUTE because it is not yet supported by the Amplify CDK
    // https://aws.amazon.com/de/blogs/mobile/deploy-a-nextjs-13-application-to-amplify-with-the-aws-cdk/
    const updatePlatform = new cr.AwsCustomResource(this, 'updatePlatform', {
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE
      }),
      onCreate: {
        service: 'Amplify',
        action: 'updateApp',
        physicalResourceId: cr.PhysicalResourceId.of('app-update-platform'),
        parameters: {
          appId: amplifyApp.appId,
          platform: 'WEB_COMPUTE',
        }
      },
    });


    // trigger build after stack creation
    // https://stackoverflow.com/questions/71664346/trigger-an-aws-amplify-build-via-aws-cdk
    const buildTrigger = new cr.AwsCustomResource(this, 'triggerAppBuild', {
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE
      }),
      onCreate: {
        service: 'Amplify',
        action: 'startJob',
        physicalResourceId: cr.PhysicalResourceId.of('app-build-trigger'),
        parameters: {
          appId: amplifyApp.appId,
          branchName: main.branchName,
          jobType: 'RELEASE',
          jobReason: 'Auto Start build',
        }
      },
    });
    buildTrigger.node.addDependency(updatePlatform);


    new CfnOutput(this, 'appId', {
      value: amplifyApp.appId,
    })
    new CfnOutput(this, 'appDomain', {
      value: `https://${main.branchName}.${amplifyApp.appId}.amplifyapp.com`
    })
  }
}