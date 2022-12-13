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
9. Update Amplify App to web compute with output from `cdk deploy`
   1. `aws amplify update-app –-app-id AppId –-platform WEB_COMPUTE`
10. Go to the AWS Amplify Console and connect the app to the repository

## Note
> Note: At the time of this post, we’ll need to run a CLI command to update the platform property of our Amplify Hosting app so that it makes use of the new hosting runtime that enables NextJS 13 features. Once deployed, the appId of our Hosting app should have been printed to the console. Use that value to run the following command in the CLI:
> 
> `aws amplify update-app –-app-id THE_APP_ID -–platform WEB_COMPUTE`

check: https://aws.amazon.com/de/blogs/mobile/deploy-a-nextjs-13-application-to-amplify-with-the-aws-cdk/ for updates
## References

[Blog Github Repo](https://github.com/focusOtter/cdk-fullstack-kitchen-sink/tree/with-hosting)
[AWS Blog](https://aws.amazon.com/de/blogs/mobile/deploy-a-nextjs-13-application-to-amplify-with-the-aws-cdk/)

