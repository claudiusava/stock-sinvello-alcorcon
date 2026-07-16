import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminModalComponent } from './create-product.component';

describe('AdminModalComponent', () => {
  let component: AdminModalComponent;
  let fixture: ComponentFixture<AdminModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
