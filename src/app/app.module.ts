import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule, HttpClient} from '@angular/common/http';

// Material
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule, MatButtonModule, MatButtonToggleModule, 
  MatSidenavModule, MatIconModule, MatListModule, MatCardModule, MatIconRegistry } from '@angular/material';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBarModule} from '@angular/material/snack-bar';

// Routing
import {APP_CONFIG, AppConfig} from './config/app.config';

import {HeaderComponent} from './header/header.component';
import { QueryComponent } from './query/query.component';
import { StateService } from './services/state/state.service';
import { QueryService } from './shared/query.service';

import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { SettingService } from './shared/setting.service';
import { SettingComponent, FilterDialog } from './setting/setting.component';

import { ClipboardModule } from 'ngx-clipboard';

const routes: Routes = [
  {path: '', redirectTo: '/query', pathMatch: 'full'},
  {path: 'query', component: QueryComponent},
  {path: 'setting', component: SettingComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    QueryComponent,
    FilterDialog,
    SettingComponent
  ],
  entryComponents: [FilterDialog],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    
    MatToolbarModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule, 
    MatSelectModule, 
    MatInputModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatDialogModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,

    HttpClientModule,
    ClipboardModule
  ],
  providers: [
    {provide: 'state', useClass: StateService},
    {provide: APP_CONFIG, useValue: AppConfig},
    QueryService, SettingService, FilterDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(matIconRegistry: MatIconRegistry) {
    matIconRegistry.registerFontClassAlias('fontawesome', 'fa');
  }
}
