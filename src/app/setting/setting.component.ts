import { Component, OnInit, Inject } from '@angular/core';
import { AppService } from '../shared/app.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ClipboardService } from 'ngx-clipboard'
import {MatSnackBar} from '@angular/material/snack-bar';
import { DbInfo } from '../shared/dbinfo.model';
@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {

  metadata: any = {};
  newField = '';
  newDbField = '';
  objectKeys = Object.keys;
  querylist: any[];
  private dbClientUrl: string;
  newFilter = {"field": "", "operation": "$eq", "value": ""};
  selectedField: string;
  importSettingText: string;
  dbs: DbInfo[];
  
  constructor(private appService: AppService, private snackBar: MatSnackBar, 
    private clipboardService: ClipboardService, public dialog: MatDialog ) { 
       this.loadMetaData();
     }

  ngOnInit() {

  }

  private loadMetaData(): any {
    this.appService.initializeMeta().subscribe(metadata=> {
      this.metadata = metadata;
      this.loadAllDbs();
      console.log("loadMeta", this.metadata)
    })
  }

  loadAllDbs(): void {
    this.appService.listAllDbs().subscribe((dbs: Array<DbInfo>) => {
      this.dbs = this.appService.filterUnderscoreDbs(dbs);
      this.createEmptyDatabaseMetadata();
      console.log("loadDbs", this.dbs)
    });
  }

  private createEmptyDatabaseMetadata(): void {
    this.dbs.forEach(db => {
      var dbMeta = this.metadata[db + ""];
      var changed = false;
      if (! dbMeta) {
        dbMeta = {};
        this.metadata[db + ""] = dbMeta;
        changed = true;
      }
      if (changed) {
        this.appService.store(this.metadata);
      }
    });
  }
   addNewField(setting, field): void {
    console.log(field + " is added");
    if (field.length && setting) {
      if (! setting.fields) {
        setting.fields = [];
      }
      setting.fields.push(field);
      this.saveSettings();
    }
  }

   openFilterDialog(settingsObj, filter): void {
    const dialogData = {filter: filter, metadata: this.metadata };
    const dialogRef = this.dialog.open(FilterDialog, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result && result.filter) {
        if (! settingsObj.filters) {
          settingsObj.filters = [];
        }
        const index = settingsObj.filters.indexOf(result.filter);
        console.log("index is " + index);
        if (index == -1) {
          settingsObj.filters.push(result.filter);
        } 
        this.saveSettings();
      }
    });
  }

  delete(list: any[], obj: any): void {
    console.log("deleting " + obj);
    const index = list.indexOf(obj);
    if (index > -1) {
      list.splice(index, 1);
      this.saveSettings();
    }
  }
   addNewFilter(settingsObj): void {
    let filter = JSON.parse(JSON.stringify(this.newFilter));
    this.openFilterDialog(settingsObj, filter);
  }

   saveSettings() : void {
     console.log(this.metadata);
    this.appService.store(this.metadata);
    this.showMessage("Settings Stored.");
  }

  private showMessage(msg): void {
    this.snackBar.open(msg, undefined, {
      duration: 2000,
    });
  }


  public export(): void {
    var settings = this.appService.getMetaData();   
    var text = JSON.stringify(settings);
    this.clipboardService.copyFromContent(text);
    this.showMessage("Copied Settings");
  }

  public import(): void {
    if (! this.importSettingText.length) {
      return;
    }
    var settings = JSON.parse(this.importSettingText);
    if (settings) {
      this.storeSettings(settings);
      this.importSettingText = undefined;
    }
  }

  public onDbChange(): void {
    var db = this.metadata.selectedDb;
    console.log('selected: ' + db);
    if (db) {
      var dbMeta = this.metadata[db];
      if (! dbMeta) {
        dbMeta = {};
        this.metadata[db] = dbMeta;
      }
    }
  }

  private storeSettings(settings): void {
    console.log("metadata[db]", this.metadata);
    this.appService.store(settings);
    this.showMessage("Settings Imported");
    this.loadMetaData();
  }

  public onUnderscoreDbConfChanged(): void {
    console.log("include", this.metadata.includeUnderscoreDbs);
    this.storeSettings(this.metadata);
  }
 }

 @Component({
  selector: 'filter-dialog',
  templateUrl: 'filter-dialog.html',
})
 export class FilterDialog {

  filter: any;
  metadata: any;
  
  objectKeys = Object.keys;

  constructor(
    public dialogRef: MatDialogRef<FilterDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.filter = data.filter;
      this.metadata = data.metadata;
      console.log("FilterDialog", this.data);
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
