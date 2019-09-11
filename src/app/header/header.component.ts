import {Component, Inject} from '@angular/core';
import {APP_CONFIG, AppConfig} from '../config/app.config';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  title: string;
  currentDate: number = Date.now();
  appConfig: any;
  menuItems: any[];
  private metadata: string;

  constructor(@Inject('state') private state, @Inject(APP_CONFIG) appConfig) {
    this.appConfig = appConfig;
    this.loadTitle();
    this.loadMenus();
    this.loadStoredMetadata();
  }

  private loadStoredMetadata(): void {
    this.metadata = localStorage.getItem("metadata");
    console.log("meta", this.metadata);
  }
  private loadTitle(): void {
    console.log('state', this.state);
    //this.stateService.getCurrentState();
    // this.state.title.subscribe((res: string) => {
    //   this.title = res;
    // });
  }

  changeLanguage(language: string): void {
    // this.translateService.use(language).subscribe(() => {
    //   this.loadMenus();
    // });
  }

  private loadMenus(): void {
    this.menuItems = [
      {link: '/query', name: 'Query'},
      {link: '/setting', name: 'Settings'}
    ];
  }
}
