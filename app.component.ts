import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { sampleData } from './data';
import { MouseEventArgs, Draggable } from '@syncfusion/ej2-base';
import { RowDDService, SelectionService } from '@syncfusion/ej2-angular-grids';
import { Scroll } from '@syncfusion/ej2-grids';
import { GridComponent, parentsUntil, addRemoveActiveClasses, ServiceLocator } from '@syncfusion/ej2-angular-grids';
import { removeClass, closest } from '@syncfusion/ej2-base'
import { Query } from '@syncfusion/ej2-data';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  providers: [RowDDService,
    SelectionService]
})
export class AppComponent {
  public srcData: Object[] = [];
  public destData: Object[] = [];

  @ViewChild('srcGrid')
  public srcGrid: GridComponent;

  @ViewChild('destGrid')
  public destGrid: GridComponent;

  public srcQuery;

  constructor() {
    
  }

  ngOnInit(): void {
    this.srcData = sampleData;
     // this sortBy order seems backwards, but the sorts are processed last to first in the chain.
    this.srcQuery = new Query().sortBy('id').sortBy('description').sortBy('code');
    debugger;
  }

  public save() {
    console.log('srcGrid.currentViewData');
    console.log(this.srcGrid.currentViewData);

    console.log('destGrid.currentViewData');
    console.log(this.destGrid.currentViewData);
  }

  public srcGridDoubleClick(event: any) {
    (this.srcGrid as any).toolTipObj.close();
    this.moveItemBetweenGrids(event.rowData, this.srcGrid, this.destGrid);
  }

  public destGridDoubleClick(event: any) {
    (this.destGrid as any).toolTipObj.close();
    this.moveItemBetweenGrids(event.rowData, this.destGrid, this.srcGrid);

  }

  public addToSelected(data: any) {
    this.moveItemBetweenGrids(data, this.srcGrid, this.destGrid);
  }

  public removeFromSelected(data: any) {
    this.moveItemBetweenGrids(data, this.destGrid, this.srcGrid);
  }

  private moveItemBetweenGrids(rowData: any, source: GridComponent, target: GridComponent) {
    source.deleteRecord('id', rowData);
    target.addRecord(rowData, target.currentViewData.length);
  }

  public destGridActionComplete(event: any) {
    console.log(event);
    if(event.requestType === 'save'){
      console.log("save");
      console.log(this.destGrid.currentViewData);
    }
    else if(event.requestType === 'delete') {
      console.log("delete");
      console.log(this.destGrid.currentViewData);
    }
     else if(event.requestType === 'refresh') {
      console.log("refresh");
      console.log(this.destGrid.currentViewData);
    }
  }

}