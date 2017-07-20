/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AnswerService } from './answer.service';

xdescribe('AnswerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnswerService]
    });
  });

  it('should ...', inject([AnswerService], (service: AnswerService) => {
    expect(service).toBeTruthy();
  }));
});
