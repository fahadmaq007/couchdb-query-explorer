import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { SettingService } from '../shared/setting.service';
import { QueryService } from '../shared/query.service';
import {DbInfo} from '../shared/dbinfo.model';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material';
import { ClipboardService } from 'ngx-clipboard'
import { SelectionModel } from '@angular/cdk/collections';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit {

  metadata: any = {};
  objectKeys = Object.keys;
  private dbClientUrl: string;
  selectedFilters: any[] = [];
  selectedDb: string;
  _idFilter: any = {"field": "_id", "operation": "$eq"};
  dbs: DbInfo[];
  dataSource = new MatTableDataSource<any>();
  // MatPaginator Output
  pageEvent: PageEvent = {pageIndex: 0, pageSize: 100, length: 0};
  pageLength: number;
  isLoading: boolean = false;
  selection = new SelectionModel<any>(true, []);
  displayedColumns: string[] = ['select'];

  constructor(private queryService: QueryService, private snackBar: MatSnackBar,
     private settingService: SettingService , private clipboardService: ClipboardService) { 
      
     }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  
  ngOnInit() {
    this.loadSettings();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  private filter(dbs, criteria): Array<DbInfo> {
    var exclude_ = criteria ? criteria.exclude_ : false;
    if (dbs) {
      dbs = dbs.filter(db => exclude_ && ! db.startsWith("_"));
    }
    return dbs;
  }

  loadAllDbs(): void {
    this.queryService.listAllDbs().subscribe((dbs: Array<DbInfo>) => {
      this.dbs = this.filter(dbs, { exclude_: true });
      this.selectedDb = this.metadata.selectedDb;
      if (! this.selectedDb) {
        this.selectedDb = this.dbs[0] + "";
      }
      this.onDbChange();
    });
  }

  onDbChange(): void {
    console.log('selected: ' + this.selectedDb);
    this.queryService.setCurrentDatabase(this.selectedDb);
    this.settingService.setSelectedDb(this.selectedDb);
    this.showMessage("Database changed to " + this.selectedDb);
    this.executeQuery();
  }

  private loadSettings(): any {
    this.metadata = this.settingService.load();
    if (this.metadata) {
      this.loadAllDbs();
      this.displayedColumns = this.displayedColumns.concat(this.metadata.fields);
      this.queryService.setMetaData(this.metadata);
    } else {
      console.error("no metadata found, creating default...");
      this.settingService.getMetaDataJson().subscribe(data => {
        console.error("no metadata found, creating default...", data);
        this.settingService.store(data);
        this.loadSettings();
      });
    }
  }

  executeQuery(): void {
    if (! this.selectedFilters.length) {
      this.dataSource.data = [];
      return;
    }
    this.isLoading = true;
    this.dbClientUrl = this.queryService.getDbClientUrl();
    var pageEvent = this.pageEvent;
    var pageSize = pageEvent.pageSize;
    var page = {pageIndex: pageEvent.pageIndex, pageSize: pageSize};
    console.log("executeQuery", page);
    this.queryService.executeQuery(this.selectedFilters, page).subscribe(data => {
      var docs = data["docs"];
      if (docs.length == 0) {
        this.showMessage("No documents found.");
      } else {
        this.showMessage("Showing " + docs.length + " documents.");
      }
      this.dataSource.data = docs;
      this.pageLength = docs.length < pageSize ? docs.length : page["length"];
      console.log("data: ", this.dataSource.data);
      this.isLoading = false;
    });
  }

  private showMessage(msg): void {
    this.snackBar.open(msg, undefined, {
      duration: 2000,
    });
  }
  onFilterChanged(filter): void {
    delete filter.$$edit; 
    console.log("onFilterChanged", filter);
    var index = this.selectedFilters.indexOf(filter);
    if (filter.selected) {
      if (index == -1) {
        this.selectedFilters.push(filter);
      } 
    } else {
      if (index > -1) {
        this.selectedFilters.splice(index, 1);
      }
    }
    this.executeQuery(); 
  }

  clearFilterSelection(): void {
    this.selectedFilters = [];
  }

  copyDocumentId(): void {
    this.selectedFilters = [];
    this.selectedFilters.push(this._idFilter);
    this.executeQuery();
  }

  showDocumentById(): void {
    this.selectedFilters = [];
    this.selectedFilters.push(this._idFilter);
    this.executeQuery();
  }

  copySelectors(): void {
    var length = this.selectedFilters.length;
    if (length == 0) {
      return;
    }
    var qObject = this.queryService.prepareQueryObject(this.selectedFilters, undefined);
    var text = JSON.stringify(qObject);
    this.clipboardService.copyFromContent(text);
    this.showMessage("Copied Text");
  }

  concatenate(field): void {
    const numSelected = this.selection.selected.length;
    var data = this.dataSource.data;
    if (numSelected > 0) {
      data = this.selection.selected;

    }

    console.log(data);
    var ids = "";
    if (! field) {
      field = "_id";
    }
    if (data) {
      for (var i = 0; i < data.length; i++) {
        var each = data[i];
        var value = each[field];
        if (ids.indexOf(value) == -1) {
          ids += "\"" + value + "\", ";
        }
      }
      ids = ids.substring(0, ids.lastIndexOf(","));
      this.clipboardService.copyFromContent(ids);
      this.showMessage("Copied Text");
    }
  }

  onPageEvent(event): void {
    console.log(event);
    this.pageEvent = event;
    this.executeQuery();
  }
}