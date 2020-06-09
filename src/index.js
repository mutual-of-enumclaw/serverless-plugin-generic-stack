'use strict';

const fs = require('fs');
const glob = require("glob");

class ServerlessPlugin {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;

        this.hooks = {
        'after:aws:package:finalize:mergeCustomProviderResources': this.package.bind(this),
        };
    }

    /**
     * Before packaging functions must be redirected to point at the binary built
     */
    package() {
        this.serverless.cli.log(`Getting cloudformation for generic computation`);
        let cft = JSON.stringify(this.serverless.service.provider.compiledCloudFormationTemplate);
        const serviceName = this.serverless.service.service.name || this.serverless.service.service;
        const stage = this.serverless.service.provider.stage;
        const replaceOriginal = `${serviceName}-${stage}`.replace('/\-/g', '\\-');
        const regex = new RegExp(`"(\\w|\\/|\\*|\\-|\\:|\\$|\\{|\\})*${replaceOriginal}(\\w|\\-|\\/|\\*|\\:)+"`, "g");
        console.log(replaceOriginal);
        const matches = cft.match(regex);
        console.log(matches);
        if(matches) {
            this.serverless.cli.log(`Retrieved matches ` + matches.length);
            for(let match of matches) {
                const replace = `{ "Fn::Sub": ${match.replace(replaceOriginal, "${AWS::StackName}")} }`;
                this.serverless.cli.log(`${match}: ${replace}`);
                cft = cft.replace(match, replace);
            }
        }

        const regexPrecise = new RegExp(`"${replaceOriginal}"`, 'g');
        const replacePrecise = '{ "Fn::Sub": "${AWS::StackName}" }';
        cft = cft.replace(regexPrecise, replacePrecise)

        this.serverless.service.provider.compiledCloudFormationTemplate = JSON.parse(cft);
        Object.keys(this.serverless.service.provider.compiledCloudFormationTemplate.Resources).forEach(k => {
            const resource = this.serverless.service.provider.compiledCloudFormationTemplate.Resources[k];
            if(resource.Type == 'AWS::IAM::Role') {
                const roleProps = resource.Properties;
                roleProps.Policies.forEach(p => {
                    if(p.PolicyName && 
                        p.PolicyName['Fn::Join'] &&
                        p.PolicyName['Fn::Join'][1]) {
                        const joinFields = p.PolicyName['Fn::Join'][1]
                        for(let i = joinFields.length - 1; i >= 0 ; i--) {
                            const f = joinFields[i];
                            if(f == serviceName) {
                                joinFields[i] = '{ "Ref": "AWS::StackName" }';
                                if(joinFields[i + 1] == stage) {
                                    joinFields.splice(i + 1, 1);
                                }
                            }
                        }
                    }
                });
            }
        });

    }
}

module.exports = ServerlessPlugin