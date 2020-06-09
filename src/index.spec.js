const genericStack = require('./index');
const fs = require('fs');
const serverlessMock = {
    service: {
        provider: {
            compiledCloudFormationTemplate: {}
        }
    },
    cli: {
        log: (message) => {
            console.log(message);
        }
    }
};

describe('index', () => {
    describe('generic-stack', () => {
        it('process file', () => {
            serverlessMock.service.provider.compiledCloudFormationTemplate = require('../data/resource.cloudformation.json');
            serverlessMock.service.service = 'nucleus-orch-metrics';
            serverlessMock.service.provider.stage = 'dev';
            const instance = new genericStack(serverlessMock);
            instance.package();

            fs.writeFileSync('./temp.json', JSON.stringify(serverlessMock.service.provider.compiledCloudFormationTemplate, null, '  '));
            expect(serverlessMock.service.provider.compiledCloudFormationTemplate)
            .toMatchObject(require('../data/expected.resource.cloudformation.json'));
        });
    });
});