import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {CounterComponent } from './app.component';

describe('CounterComponent', () => {
  it('should create the app', async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent],
      providers: [provideRouter([])]
    }).compileComponents();
    
    const fixture = TestBed.createComponent(CounterComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
