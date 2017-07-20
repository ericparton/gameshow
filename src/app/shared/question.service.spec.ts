/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { QuestionService } from './question.service';

xdescribe('QuestionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestionService]
    });
  });

  it('should ...', inject([QuestionService], (service: QuestionService) => {
    expect(service).toBeTruthy();
  }));
});
