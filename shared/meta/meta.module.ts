import { Module } from '@nestjs/common';
import * as gitLibrary from 'git-rev';
import {GitLibrary, GitService} from "./git.service";

const gitLibraryProvider = {
    provide: 'GitLibrary',
    useValue: gitLibrary as GitLibrary,
};

@Module({
    providers: [
        gitLibraryProvider,
        GitService,
    ],
    exports: [GitService],
})
export class MetaModule {}
