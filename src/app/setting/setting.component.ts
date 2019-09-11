import { Component, OnInit, Inject } from '@angular/core';
import { SettingService } from '../shared/setting.service';
import { QueryService } from '../shared/query.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ClipboardService } from 'ngx-clipboard'
import {MatSnackBar} from '@angular/material/snack-bar';
@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {

  metadata: any = {};
  newField = '';
  objectKeys = Object.keys;
  querylist: any[];
  private dbClientUrl: string;
  newFilter = {"field": "", "operation": "$eq", "value": ""};
  selectedField: string;
  importSettingText: string;

  constructor(private queryService: QueryService, private snackBar: MatSnackBar, 
    private clipboardService: ClipboardService, private settingService: SettingService, public dialog: MatDialog ) { 
       this.loadMetaData();
     }

  ngOnInit() {

  }

  private loadMetaData(): any {
    this.metadata = this.settingService.load();
    if (! this.metadata) {
      this.settingService.getMetaDataJson().subscribe(data => {
        this.metadata = data;
        this.settingService.store(this.metadata);
        this.queryService.setMetaData(this.metadata);
        console.log("getMetaDataJson", this.metadata);
      });
    } else {
      this.queryService.setMetaData(this.metadata);
    }
  }

   addNewField(): void {
    console.log(this.newField + " is added");
    if (this.newField.length) {
      var fields = this.metadata.fields;
      if (fields) {
        fields.push(this.newField);
        this.newField = '';
        this.saveSettings();
      }
    }
  }

   openFilterDialog(filter): void {
    const dialogData = {filter: filter, metadata: this.metadata };
    const dialogRef = this.dialog.open(FilterDialog, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result && result.filter) {
        const index = this.metadata.filters.indexOf(result.filter);
        console.log("index is " + index);
        if (index == -1) {
          this.metadata.filters.push(result.filter);
        } 
        this.saveSettings();
      }
    });
  }

   addNewFilter(): void {
    let filter = JSON.parse(JSON.stringify(this.newFilter));
    this.openFilterDialog(filter);
  }

   saveSettings() : void {
    this.settingService.store(this.metadata);
    this.showMessage("Settings Stored.");
  }

  private showMessage(msg): void {
    this.snackBar.open(msg, undefined, {
      duration: 2000,
    });
  }


  public export(): void {
    var settings = this.settingService.getMetaData();   
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
      this.settingService.store(settings);
      this.metadata = this.settingService.load();
      this.importSettingText = undefined;
      this.showMessage("Settings Imported");
    }
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
