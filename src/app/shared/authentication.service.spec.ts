/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AuthServiceService } from './auth-service.service';

describe('AuthenticationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthServiceService]
    });
  });

  it('should ...', inject([AuthServiceService], (service: AuthServiceService) => {
    expect(service).toBeTruthy();
  }));
});
