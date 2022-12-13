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
			// environmentVariables: props.environmentVariables,
			buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: '1.0',
        appRoot: 'app',
				frontend: {
					phases: {
						preBuild: {
							commands: ['npm ci'],
						},
						build: {
							commands: ['npm run build'],
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
			}),
		})

		const main =amplifyApp.addBranch('main', {
			stage: 'PRODUCTION',
		})

		new CfnOutput(this, 'appId', {
			value: amplifyApp.appId,
		})
    new CfnOutput(this, 'appDomain', {
			value: `https://${main.branchName}.${amplifyApp.appId}.amplifyapp.com`
		})
	}
}