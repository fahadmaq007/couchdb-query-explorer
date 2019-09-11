import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

@Injectable()
export class SettingService {

    private jsonUrl: string;
    private metadata: any;

    constructor(private http: HttpClient) {
        this.jsonUrl = "./assets/metadata.json";
    }

    public getMetaDataJson(): Observable<any> {
        return this.http.get(this.jsonUrl);
    }

    public getMetaData(): any {
        return this.metadata;
    }

    public store(metadata: any) {
        localStorage.setItem("metadata", JSON.stringify(metadata));
    }

    public load(): any {
        const str = localStorage.getItem("metadata");
        console.log("load str", str);
        var metadata = undefined;
        if (str !== undefined) {
            metadata = JSON.parse(str);
            this.metadata = metadata;
        }
        // if (! metadata.couchUrl) {
        //     metadata.couchUrl = "http://localhost:5984";
        // }
        
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