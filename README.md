# serverless-plugin-catdir
This plugin removes hard-coded values set by the serverless framework and replaces them with a reference to the AWS::StackName reference.  This allows stacks to be made generic and be deployed without requiring a recompile with the serverless framework.

## Use case
You want to use serverless framework to deploy components multiple times to different environments after a single build.

# Implementing

Install the plugin into the directory your serverless.yml is located
``` bash
npm install serverless-generic-stack
```

Add the decouple plugin to your plugins, and add a custom variable to turn it on
```yaml
plugins:
    - serverless-plugin-generic-stack
```

