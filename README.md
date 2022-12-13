# Nextjs AWS Amplify CDK example

This is an example of how to use AWS Amplify with Nextjs and CDK.

## Getting Started

1. Setup AWS credentials
2. Install AWS CDK
3. Fork this repo
4. Install the Amplify GitHub App in your account
   1. Open a web browser and navigate to the installation location for the Amplify GitHub App in the AWS Region where you will deploy your app. https://github.com/apps/aws-amplify-us-east-1/installations/new, Replace `REGION` with your region, e.g. `us-east-1`
   2. Install
   3. Add your repository
5. Create Github Personal Access Token
   1. with `repo` and `admin:repo_hook` permissions
6. change the `owner` and `repository` in `infrastructure/bin/infrastructure.ts`
7. change directory to `infrastructure`
8. Deploy the NextJS app with `GITHUB_ACCESS_TOKEN=xxx cdk deploy`
9. Wait a few minutes until the application is deployed, you can check the status in the AWS Amplify Console.
   1.  if it is not working redeploy the stack manually

## Note
> Note: At the time of this post, we’ll need to run a CLI command to update the platform property of our Amplify Hosting app so that it makes use of the new hosting runtime that enables NextJS 13 features. Once deployed, the appId of our Hosting app should have been printed to the console. Use that value to run the following command in the CLI:
> 
> `aws amplify update-app –-app-id THE_APP_ID -–platform WEB_COMPUTE`

=> this has been added to the cdk script with a `awsCustomResource` to update the app. 

check: https://aws.amazon.com/de/blogs/mobile/deploy-a-nextjs-13-application-to-amplify-with-the-aws-cdk/ for updates
## References

[Blog Github Repo](https://github.com/focusOtter/cdk-fullstack-kitchen-sink/tree/with-hosting)
[AWS Blog](https://aws.amazon.com/de/blogs/mobile/deploy-a-nextjs-13-application-to-amplify-with-the-aws-cdk/)

AWS_PROFILE=hf-sm AWS_DEFAULT_REGION=us-east-1 GITHUB_ACCESS_TOKEN=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 cdk deploy
AWS_PROFILE=hf-sm AWS_DEFAULT_REGION=us-east-1 aws amplify update-app --app-id d239cabd9ve986 --platform WEB_COMPUTE >> /dev/null