import {GitLibrary, GitService} from './git.service';
import {Test} from "@nestjs/testing";

describe('GitService', () => {
    let gitService: GitService;
    const gitLibrary: GitLibrary = {
        short: jest.fn(),
        long: jest.fn(),
        branch: jest.fn(),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                GitService,
                {
                    provide: 'GitLibrary',
                    useValue: gitLibrary,
                },
            ],
        })
            .compile();
        gitService = await module.get<GitService>(GitService);
        jest.resetAllMocks();
    });

    describe('getCurrentBranch', () => {
        it('returns the current branch', async () => {
            const expectedBranch = 'tdd-ftw';
            gitLibrary.branch = jest.fn(callback => callback(expectedBranch));

            const actualBranch = await gitService.getCurrentBranch();

            expect(actualBranch).toBe(expectedBranch);
        });
    });

    describe('getLatestCommitShortHash', () => {
        it('returns the latest commit short hash', async () => {
            const expectedHash = '3f17f344';
            gitLibrary.short = jest.fn(callback => callback(expectedHash));

            const actualHash = await gitService.getLatestCommitShortHash();

            expect(actualHash).toBe(expectedHash);
        });
    });

    describe('getLatestCommitLongHash', () => {
        it('returns the latest commit long hash', async () => {
            const expectedHash = '3f17f344448066d75f9eb33ade5fdcd799d89352';
            gitLibrary.long = jest.fn(callback => callback(expectedHash));

            const actualHash = await gitService.getLatestCommitLongHash();

            expect(actualHash).toBe(expectedHash);
        });
    });
});
