import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AppService } from '../shared/app.service';
import { DbInfo } from '../shared/dbinfo.model';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material';
import { ClipboardService } from 'ngx-clipboard'
import { SelectionModel } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  _idFilter: any = { "field": "_id", "operation": "$eq" };
  dbs: DbInfo[];
  dataSource = new MatTableDataSource<any>();
  // MatPaginator Output
  pageEvent: PageEvent = { pageIndex: 0, pageSize: 100, length: 0 };
  pageLength: number;
  isLoading: boolean = false;
  selection = new SelectionModel<any>(true, []);
  displayedColumns: string[] = [];
  filters: any[] = [];
  downloadJsonHref: SafeUrl;

  constructor(private appService: AppService, private snackBar: MatSnackBar,
    private clipboardService: ClipboardService, private sanitizer: DomSanitizer) {

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

  loadAllDbs(): void {
    this.appService.listAllDbs().subscribe((dbs: Array<DbInfo>) => {
      this.dbs = this.appService.filterUnderscoreDbs(dbs);
      var selectedDb = this.metadata.selectedDb;
      if (! selectedDb) {
        this.metadata.selectedDb = this.dbs[0] + "";
      }
      this.onDbChange();
    });
  }
  
  public onDbChange(): void {
    console.log("onDbChange" + this.metadata.selectedDb);
    this.appService.setSelectedDb(this.metadata.selectedDb);
    this.mergeFilters();
    var columns = ['select'].concat(this.metadata.fields);
    if (this.metadata[this.metadata.selectedDb] && this.metadata[this.metadata.selectedDb].fields) {
      columns = columns.concat(this.metadata[this.metadata.selectedDb].fields);
    }
    this.displayedColumns = columns;
    console.log('displayedColumns: ' + this.metadata.selectedDb, this.displayedColumns);
    this.showMessage("Database changed to " + this.metadata.selectedDb);
    this.executeQuery();
  }

  private mergeFilters(): void {
    var filters = this.appService.clone(this.metadata.filters);
    if (this.metadata.selectedDb) {
      var dbConf = this.metadata[this.metadata.selectedDb];
      if (dbConf) {
        var dbFilters = dbConf.filters;
        if (dbFilters) {
          filters = dbFilters.concat(filters);
        }
      }
    }
    this.filters = filters;
  }

  private loadSettings(): any {
    this.appService.initializeMeta().subscribe(metadata => {
      this.metadata = metadata;
      console.log("Query loadMeta", this.metadata)
      this.loadAllDbs();
    });
  }

  executeQuery(): void {
    if (!this.selectedFilters.length) {
      this.dataSource.data = [];
      return;
    }
    this.isLoading = true;
    this.dbClientUrl = this.appService.getDbClientUrl();
    var pageEvent = this.pageEvent;
    var pageSize = pageEvent.pageSize;
    var page = { pageIndex: pageEvent.pageIndex, pageSize: pageSize };
    this.appService.executeQuery(this.selectedFilters, page).subscribe(data => {
      var docs = data["docs"];
      this.dataSource.data = docs;
      this.pageLength = docs.length < pageSize ? docs.length : page["length"];  
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
    delete filter.selected;
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
    this.selectedFilters = [];
  }

  copySelectors(): void {
    var length = this.selectedFilters.length;
    if (length == 0) {
      return;
    }
    var qObject = this.appService.prepareQueryObject(this.selectedFilters, undefined);
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
    var ids = "";
    if (!field) {
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

  private getCopiedData(): string {
    const numSelected = this.selection.selected.length;
    var data = this.dataSource.data;
    if (numSelected > 0) {
      data = this.selection.selected;
    }

    var text = "";
    if (data) {
      if (data.length == 1) {
        text = JSON.stringify(data[0]);
      } else {
        for (var i = 0; i < data.length; i++) {
          var each = data[i];
          var value = JSON.stringify(data[i]);
          text += value + ", ";
        }
        text = "[" + text.substring(0, text.lastIndexOf(",")) + "]";
      }
    }
    return text;
  }
  copyDocuments(): void {
    var text = this.getCopiedData();
    this.clipboardService.copyFromContent(text);
    this.showMessage("Copied Document(s)");
  }

  onPageEvent(event): void {
    console.log(event);
    this.pageEvent = event;
    this.executeQuery();
  }

  generateDownloadJsonUri() {
    var text = this.getCopiedData();
    var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(text));
    this.downloadJsonHref = uri;
  }
}