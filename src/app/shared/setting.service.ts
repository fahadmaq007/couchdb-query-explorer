import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { DbInfo } from './dbinfo.model';
import {catchError, map} from 'rxjs/operators';
import {_throw} from 'rxjs/observable/throw';
import { of } from 'rxjs/observable/of';
@Injectable()
export class SettingService {

    private jsonUrl: string;
    private metadata: any;

    constructor(private httpClient: HttpClient) {
        this.jsonUrl = "./assets/metadata.json";
    }

    public listAllDbs(): Observable<DbInfo[]> {
        var url = this.getCouchUrl() + '/_all_dbs';
        return this.httpClient.get(url, {
            
        }).pipe(catchError(
            error => this.handleError(error)
        ));
    }

    private handleError(error: any) {
        if (error instanceof Response) {
            return _throw(error.json()['error'] || 'backend server error');
        }
        // in a case server returns 400 error, which means no data found
        return of([]);
    }

    public getMetaDataJson(): Observable<any> {
        return this.httpClient.get(this.jsonUrl);
    }

    public getMetaData(): any {
        return this.metadata;
    }

    public store(metadata: any) {
        localStorage.setItem("metadata", JSON.stringify(metadata));
    }

    public load(): any {
        const str = localStorage.getItem("metadata");
        var metadata = undefined;
        if (str !== undefined) {
            metadata = JSON.parse(str);
            this.metadata = metadata;
        }
        return this.metadata;
    }

    public getSelectedDb(): string {
        return this.getMetaData().selectedDb;
    }

    public setSelectedDb(db: string): void {
        var metadata = this.getMetaData();
        metadata.selectedDb = db;
        this.store(metadata);
    }

    public getCouchUrl(): string {
        return this.getMetaData().couchUrl;
    }

}