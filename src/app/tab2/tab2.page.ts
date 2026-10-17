
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonAlert,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import { CounterService } from '../services/counter.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonAlert,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToast,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);

  // BONUS 1 – součet všech uložených hodnot
  readonly total = computed(() =>
    this.counterService.counters().reduce(
      (sum, counter) => sum + counter.value,
      0,
    ),
  );

  // BONUS 2 – způsob řazení
  readonly sortMode = signal('newest');

  // BONUS 3 – vyhledávaný text
  readonly searchTerm = signal('');

  // Filtrovaná a seřazená historie
  readonly filteredCounters = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();

    const counters = this.counterService.counters().filter(
      (counter) => counter.name.toLowerCase().includes(search),
    );

    switch (this.sortMode()) {
      case 'nameAsc':
        return counters.sort((a, b) =>
          a.name.localeCompare(b.name, 'cs'),
        );

      case 'nameDesc':
        return counters.sort((a, b) =>
          b.name.localeCompare(a.name, 'cs'),
        );

      case 'valueAsc':
        return counters.sort((a, b) => a.value - b.value);

      case 'valueDesc':
        return counters.sort((a, b) => b.value - a.value);

      default:
        return counters.sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        );
    }
  });

  // BONUS 4 – potvrzovací dialog
  readonly alertOpen = signal(false);

  readonly alertButtons = [
    {
      text: 'Zrušit',
      role: 'cancel',
    },
    {
      text: 'Vymazat',
      role: 'destructive',
      handler: () => {
        void this.clear();
      },
    },
  ];

  // BONUS 5 – oznámení
  readonly toastOpen = signal(false);
  readonly toastMessage = signal('');

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
    this.showToast('Záznam byl odstraněn.');
  }

  async clear(): Promise<void> {
    await this.counterService.clear();
    this.showToast('Historie byla vymazána.');
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastOpen.set(true);
  }
}
