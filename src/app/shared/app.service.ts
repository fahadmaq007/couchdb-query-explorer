import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../config/app.config';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/map';
import { DbInfo } from './dbinfo.model';
import { Observer } from 'rxjs/Observer';
import { isObject } from 'util';

@Injectable()
export class AppService {
    private headers: HttpHeaders;
    private allDbs: Observable<DbInfo[]>;
    title: Observable<string>;
    private metadata: any;
    private operations: any;
    private jsonUrl: string;

    constructor(private httpClient: HttpClient) {
        this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        this.jsonUrl = "./assets/metadata.json";
    }

    public initializeMeta(): Observable<any> {
        return new Observable<any>(observer => {
            var metadata = this.metadata;
            if (! metadata) {
                console.log("this.metadata not found")
                metadata = this.loadFromLocalStorage();
                console.log("this.metadata is from localstorage", metadata)
                if (! metadata) {
                    this.getMetaDataJson().subscribe(data => {
                        this.metadata = data;
                        observer.next(data);
                    });
                    console.log("this.metadata loaded from json file", metadata)
                } 
            }
            if (metadata) {
                this.metadata = metadata;
                observer.next(metadata);
            }
        });
    }
    public getMetaDataJson(): any {
        return this.httpClient.get(this.jsonUrl);
    }

    public getMetaData(): any {
        return this.metadata;
    }

    public getCouchUrl(): string {
        return this.getMetaData().couchUrl;
    }

    public store(metadata: any) {
        if (metadata) {
            this.metadata = metadata;
            localStorage.setItem("metadata", JSON.stringify(metadata));
        }
    }

    private loadFromLocalStorage(): any {
        const str = localStorage.getItem("metadata");
        var metadata = undefined;
        if (str !== undefined) {
            metadata = JSON.parse(str);
            this.metadata = metadata;
        }
        return this.metadata;
    }

    public listAllDbs(): Observable<DbInfo[]> {
        var url = this.getCouchUrl() + '/_all_dbs';
        return this.httpClient.get<DbInfo[]>(url);
    }

    public getSelectedDb(): string {
        return this.getMetaData().selectedDb;
    }

    public setSelectedDb(db: string): void {
        var metadata = this.getMetaData();
        metadata.selectedDb = db;
        this.store(metadata);
    }

    private handleError(error: any) {
        if (error instanceof Response) {
            return _throw(error.json()['error'] || 'backend server error');
        }
        // in a case server returns 400 error, which means no data found
        return of([]);
    }

    setMetaData(metadata: any) {
        this.metadata = metadata;
        this.operations = metadata.operations;
    }

    getDbClientUrl(): string {
        return this.getCouchUrl() + '/_utils/#database/' + this.getSelectedDb();
    }

    getDbUrl(): string {
        return this.getCouchUrl() + '/' + this.getSelectedDb();
    }

    prepareQueryObject(filters: any[], page: any): any {
        var qObject = {
            "selector": {}
        }
        if (page) {
            var pageSize = page.pageSize;
            qObject["limit"] = pageSize;
            var pageIndex = page.pageIndex;
            page.length = pageSize * 2;
            if (pageIndex > 0) {
                var skip = pageIndex * pageSize;
                page.length += skip;
                qObject["skip"] = skip;
            }
        }
        filters.forEach(each => {
            let filter = this.clone(each); // clone
            if (!filter.value) {
                filter.value = filter.$$value;
            }
            if (filter.operation == '$regex') {
                filter.value = "(?i)" + filter.value;
            }
            qObject.selector[filter.field] = {};
            qObject.selector[filter.field][filter.operation] = filter.value;
        });
        return qObject;
    }
    executeQuery(filters: any[], page: any): Observable<any[]> {
        var url = this.getDbUrl() + '/_find';
        var qObject = this.prepareQueryObject(filters, page);
        console.log("qObject: " + JSON.stringify(qObject));

        return this.httpClient.post<any[]>(url, qObject)
            .pipe(catchError(
                error => this.handleError(error)
            ));
    }

    filterUnderscoreDbs(dbs): Array<DbInfo> {
        var include = this.metadata.includeUnderscoreDbs;
        if (! include) {
            dbs = dbs.filter(db => ! db.startsWith("_"));
        }
        // dbs = dbs.filter(db => ! db.startsWith("cmf"));
        return dbs;
    }

    clone(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }
    
    stringify(obj: any): any {
        var text = "";
        if (obj) {
            for (const key in obj) {
                var fields = ['_rev', '_id', 'id', 'orgId', 'lastUpdatedTime', 'creationDate'].concat(this.metadata.fields);
                if (! fields.includes(key)) {
                    const element = obj[key];
                    var value = element;
                    if (element && element instanceof Object) {
                       value = JSON.stringify(element); 
                       if (value.length > 50) {
                        value = value.substring(0, 50);
                       }
                    } 
                    text += key + ": " + value + ", ";
                }
            }
        }
        var json = "{" + text.substring(0, text.lastIndexOf(",")) + "}"; 
        return JSON.stringify(json, undefined, 3);
    }
}