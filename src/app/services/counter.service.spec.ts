
import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from './counter.service';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('CounterService', () => {
  let service: CounterService;

  const getMock = vi.mocked(Preferences.get);
  const setMock = vi.mocked(Preferences.set);
  const removeMock = vi.mocked(Preferences.remove);

  const first: SavedCounter = {
    id: 'first',
    name: 'První',
    value: 1,
    createdAt: '2026-09-17T08:00:00.000Z',
  };

  const second: SavedCounter = {
    id: 'second',
    name: 'Druhé',
    value: 2,
    createdAt: '2026-09-17T09:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    getMock.mockResolvedValue({ value: null });
    setMock.mockResolvedValue(undefined);
    removeMock.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [CounterService],
    });

    service = TestBed.inject(CounterService);
  });

  // PŘIPRAVENÝ TEST – inicializace pouze jednou
  it('should initialize only once', async () => {
    await Promise.all([
      service.initialize(),
      service.initialize(),
    ]);

    await service.initialize();

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(service.initialized()).toBe(true);
    expect(service.counters()).toEqual([]);
  });

  // ÚKOL 1 – načtení uložených dat
  it('should load saved counters', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });

    await service.initialize();

    expect(service.counters()).toEqual([first, second]);
    expect(service.initialized()).toBe(true);

    expect(getMock).toHaveBeenCalledWith({
      key: 'saved-counters',
    });
  });

  // ÚKOL 2 – přidání nového záznamu
  it('should add a counter and save it', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first]),
    });

    await service.add(second);

    expect(service.counters()).toEqual([second, first]);

    expect(setMock).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([second, first]),
    });
  });

  // ÚKOL 3 – odstranění jednoho záznamu
  it('should remove only the selected counter', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });

    await service.remove(first.id);

    expect(service.counters()).toEqual([second]);

    expect(setMock).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([second]),
    });
  });

  // ÚKOL 4 – vymazání celé historie
  it('should clear all counters', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });

    await service.clear();

    expect(service.counters()).toEqual([]);

    expect(removeMock).toHaveBeenCalledTimes(1);
    expect(removeMock).toHaveBeenCalledWith({
      key: 'saved-counters',
    });

    expect(setMock).not.toHaveBeenCalled();
  });

  // ÚKOL 5 – poškozená uložená hodnota
  it('should recover from invalid JSON', async () => {
    getMock.mockResolvedValue({
      value: 'this is not a valid JSON',
    });

    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      await service.initialize();

      expect(service.counters()).toEqual([]);
      expect(service.initialized()).toBe(true);

      expect(errorSpy).toHaveBeenCalledWith(
        'Historii počítadel se nepodařilo načíst.',
        expect.any(Error),
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
