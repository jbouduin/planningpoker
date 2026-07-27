import { TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { By } from '@angular/platform-browser';
import { Card } from './card';

describe('CardComponent', () => {
  const someCard = new Card({ isEstimation: true, index: 0, isUnknownEstimation: false, isIcon: false, label: '12' });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CardComponent
      ],
    }).compileComponents();
  });

  it('CardComponent should be created', () => {
    const fixture = TestBed.createComponent(CardComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('if card is null, card should be greyed out/no click emitted', () => {
    const fixture = TestBed.createComponent(CardComponent);
    const component = fixture.componentInstance;
    component.card = undefined;
    fixture.detectChanges();
    const debugElement = fixture.debugElement;
    const image = debugElement.query(By.css('img'));
    expect(image).toBeTruthy();
    expect(image.classes['greyed']).toBeTrue();
  });

  it('if isavailable card, values should be displayed', () => {
    const fixture = TestBed.createComponent(CardComponent);
    const component = fixture.componentInstance;
    component.card = someCard;
    component.isAvailableCard = true;
    fixture.detectChanges();
    const debugElement = fixture.debugElement;
    const valueWrapper = debugElement.query(By.css('div'));
    expect(valueWrapper.classes['value-wrapper']).toBeTrue();
    const inner = valueWrapper.query((By.css('div')));
    expect(inner.classes['value-wrapper']).toBeTrue();
  });

  it('if not mine/not available card/not revealed, no values should be displayed', () => {
    const fixture = TestBed.createComponent(CardComponent);
    const component = fixture.componentInstance;
    component.card = someCard;
    component.isAvailableCard = false;
    component.mine = false;
    component.revealed = false;
    fixture.detectChanges();
    const debugElement = fixture.debugElement;
    const valueWrapper = debugElement.query(By.css('div'));
    expect(valueWrapper.classes['value-wrapper']).toBeTrue();
    const inner = valueWrapper.query((By.css('div')));
    expect(inner.classes['value-wrapper']).toBeFalsy();
  });
});
