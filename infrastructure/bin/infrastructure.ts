#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AmplifyHostingStack } from '../lib/infrastructure-stack';

const amplifyProps =   {
  // Name given to plaintext secret in secretsManager.
  // When creating the token scope on Github, only the admin:repo_hook scope is needed
  githubOauthTokenName: process.env.GITHUB_ACCESS_TOKEN || '',
  owner: 'philschmid',
  repository: 'nextjs-amplify-cdk-sample',
  //pass in any envVars from the above stacks here
}


const app = new cdk.App();
new AmplifyHostingStack(app, 'AmplifyHostingStack', {
  ...amplifyProps,
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});