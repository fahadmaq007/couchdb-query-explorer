import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { SettingComponent } from './setting/setting.component';
import { QueryComponent } from './query/query.component';


const routes: Routes = [
  {path: '', redirectTo: '/query', pathMatch: 'full'},
  {path: 'query', component: QueryComponent},
  {path: 'setting', component: SettingComponent}
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)]
})

export class AppRoutingModule {
}
