import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppConfig} from '../config/app.config';
import {Observable} from 'rxjs/Observable';
import {catchError, map} from 'rxjs/operators';
import {_throw} from 'rxjs/observable/throw';
import {of} from 'rxjs/observable/of';
import {DbInfo} from './dbinfo.model';
import {SettingService} from './setting.service';

@Injectable()
export class QueryService {
    private headers: HttpHeaders;
    private allDbs: Observable<DbInfo[]>;
    title: Observable<string>;
    private metadata: any;
    private operations: any;
    private db: any;

    constructor(private httpClient: HttpClient, private settingService: SettingService) {
        this.headers = new HttpHeaders({'Content-Type': 'application/json'});
    }

    listAllDbs(): Observable<DbInfo[]> {
        var url = this.settingService.getCouchUrl() + '/_all_dbs';
        return this.httpClient.get(url, {
            'headers': this.headers
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

    setCurrentDatabase(db: string) {
        this.db = db;
    }

    setMetaData(metadata: any) {
        this.metadata = metadata;
        this.operations = metadata.operations;
    }

    getDbClientUrl(): string {
        return this.settingService.getCouchUrl() + '/_utils/#database/' + this.db;
    }

    getDbUrl(): string {
        return this.settingService.getCouchUrl() + '/' + this.db;
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
            let filter = JSON.parse(JSON.stringify(each)); // clone
            if (! filter.value) {
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
        
        return this.httpClient.post(url, qObject)
        .pipe(catchError(
            error => this.handleError(error)
        ));
    }
}