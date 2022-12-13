import { CfnOutput, SecretValue, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import {
  App,
  GitHubSourceCodeProvider,
  RedirectStatus,
} from '@aws-cdk/aws-amplify-alpha'

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
      environmentVariables: {"AMPLIFY_MONOREPO_APP_ROOT": "app", "AMPLIFY_DIFF_DEPLOY": "false"},
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
                  commands: ['npm run build' ,"pwd", "ls -all"],
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
      framework: 'Next.js - SSR',
    })

    new CfnOutput(this, 'appId', {
      value: amplifyApp.appId,
    })
    new CfnOutput(this, 'appDomain', {
      value: `https://${main.branchName}.${amplifyApp.appId}.amplifyapp.com`
    })
  }
}