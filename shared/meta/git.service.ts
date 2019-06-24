import {Inject, Injectable} from "@nestjs/common";

export interface GitLibrary {
    short(callback: (shortCommitHash: string) => any): any;
    long(callback: (longCommitHash: string) => any): any;
    branch(callback: (branch: string) => any): any;
}

@Injectable()
export class GitService {
    constructor(@Inject('GitLibrary') private readonly gitLibrary: GitLibrary) {}

    public async getCurrentBranch(): Promise<string> {
        return new Promise((resolve) => {
            this.gitLibrary.branch(resolve);
        });
    }

    public async getLatestCommitShortHash(): Promise<string> {
        return new Promise((resolve) => {
            this.gitLibrary.short(resolve);
        });
    }

    public async getLatestCommitLongHash(): Promise<string> {
        return new Promise((resolve) => {
            this.gitLibrary.long(resolve);
        });
    }
}
