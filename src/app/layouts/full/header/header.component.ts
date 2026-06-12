import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
} from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { CoreService } from 'src/app/services/core.service';
import { SecurityService } from 'src/app/services/security.service';
import { NotificationService } from 'src/app/services/notification.service';
import { AuthService } from 'src/app/services/auth.service';

import { User } from 'src/app/models/user';
import { AppSettings } from 'src/app/config';

import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';

interface notifications {
  id: number;
  img: string;
  title: string;
  subtitle: string;
}

interface profiledd {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit, OnDestroy {

  @Input() showToggle = true;
  @Input() toggleChecked = false;

  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();
  @Output() optionsChange = new EventEmitter<AppSettings>();

  showFiller = false;

  user: User | null = null;

  private userSubscription?: Subscription;
  private notificationSubscription?: Subscription;

  options = this.settings.getOptions();

  constructor(
    private settings: CoreService,
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private securityService: SecurityService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    console.log('HeaderComponent ngOnInit: suscribiéndose a usuario actual...');

    this.userSubscription = this.securityService
      .getCurrentUser()
      .subscribe((user) => {
        console.log('Usuario actual en HeaderComponent:', user);
        this.user = user;
      });

    console.log('HeaderComponent ngOnInit: suscribiéndose a notificaciones...');

    this.notificationSubscription = this.notificationService
      .onNewNotification('new_notification')
      .subscribe((data: any) => {
        console.log('Notificación recibida:', data);
        this.notifications.push(data);
      });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.notificationSubscription?.unsubscribe();
  }

  private emitOptions(): void {
    this.optionsChange.emit(this.options);
  }

  setlightDark(theme: string): void {
    this.options.theme = theme;
    this.emitOptions();
  }

  getUserDisplayName(): string {
    return this.user?.name || this.user?.email || 'Usuario';
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.securityService.clearUser();
      this.router.navigate(['/authentication/login']);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  }

  notifications: notifications[] = [
    {
      id: 1,
      img: '/assets/images/profile/user-1.jpg',
      title: 'Roman Joined thes Team!',
      subtitle: 'Congratulate him',
    },
    {
      id: 2,
      img: '/assets/images/profile/user-2.jpg',
      title: 'New message received',
      subtitle: 'Salma sent you new message',
    },
    {
      id: 3,
      img: '/assets/images/profile/user-3.jpg',
      title: 'New Payment received',
      subtitle: 'Check your earnings',
    },
    {
      id: 4,
      img: '/assets/images/profile/user-4.jpg',
      title: 'Jolly completed tasks',
      subtitle: 'Assign her new tasks',
    },
    {
      id: 5,
      img: '/assets/images/profile/user-5.jpg',
      title: 'Roman Joined the Team!',
      subtitle: 'Congratulatse him',
    },
  ];

  profiledd: profiledd[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-account.svg',
      title: 'My Profile',
      subtitle: 'Account Settings',
      link: '/',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-inbox.svg',
      title: 'My Inbox',
      subtitle: 'Messages & Email',
      link: '/',
    },
    {
      id: 3,
      img: '/assets/images/svgs/icon-tasks.svg',
      title: 'My Tasks',
      subtitle: 'To-do and Daily Tasks',
      link: '/',
    },
  ];
}