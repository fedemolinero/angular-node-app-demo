import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { cvIdsModel, ResumeModel } from '@app/models/response.model';
import { DataService } from '@app/services/data-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cvlist',
  templateUrl: './cvlist.component.html',
  styleUrl: './cvlist.component.scss'
})
export class CvlistComponent implements OnInit, OnDestroy {
  private cvListSubscription: Subscription = new Subscription;
  @Output() idSelected = new EventEmitter<string>();

  cvList!: any;
  name: string = 'new';
  newID!: cvIdsModel;

  constructor(private personalDataService: DataService) { }

  ngOnInit(): void {
    this.getCVList();
  }

  ngOnDestroy(): void {
    if (this.cvListSubscription) {
      this.cvListSubscription.unsubscribe();
    }
  }

  openEditor(id: any) {
    this.idSelected.emit(id);
  }

  createNewCV() {
    this.personalDataService.createNewCv(this.name)
      .subscribe(
        {
          next: (response: cvIdsModel) => {
            this.newID = response;
          },
          error: (e) => {
            console.error(e);
          }
        }
      );
  }

  getCVList() {
    this.cvListSubscription = this.personalDataService.getCvList()
      .subscribe(
        {
          next: (cvListResponse: any) => {
            console.log('cvListResponse', cvListResponse)
            this.cvList = cvListResponse;
          },
          error: (e) => {
            console.error(e);
          }
        }
      );
  }

}
