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
  public selectedIndices = [];
  public dragStartRow: any;
  public flag: boolean = false;
  public drop: boolean = false;

  @ViewChild('srcGrid')
  public srcGrid: GridComponent;

  @ViewChild('destGrid')
  public destGrid: GridComponent;

  public srcQuery;

  constructor() {
    
  }

  ngOnInit(): void {
    this.srcData = sampleData;
    (this.destGrid as any).preRender = () => {
      this.destGrid.on('rows-added', this.moveToBottomRow.bind(this));
      this.destGrid.serviceLocator = new ServiceLocator();
      (this.destGrid as any).initProperties();
      (this.destGrid as any).initializeServices();
    };
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




public srcGridCreated() {
		(this.srcGrid.getContent() as any).ej2_instances[1].enableTailMode = true;
		this.destGrid.on('rows-added', this.moveToBottomRow.bind(this));
	}

	public moveToBottomRow(args: any) {
		if (this.drop) {
			args.toIndex = this.destGrid.currentViewData.length > 0
				? this.destGrid.currentViewData.length + 1 : this.destGrid.currentViewData.length;
			this.drop = false;
		} else {
			args.toIndex = args.toIndex + 1;
		}
	}

	public srcRowDrop(args: any) {
		(this.srcGrid as any).toolTipObj.close();
		this.flag = false;
		if (args.target.classList.contains('e-content')) {
			this.drop = true;
		}
	}

	public srcRowDrag() {
		this.flag = true;
	}

	public destGridActionComplete(args: any) {
		if (args.requestType === 'refresh' && this.selectedIndices.length > 0) {
			this.destGrid.selectRows(this.selectedIndices);
		}
	}

	public destRowDragStartHelper(args: any) {
		this.dragStartRow = args.selectedRow[0];
	}

	public destRowDrag(args: any) {
		const element: HTMLTableRowElement = closest(args.originalEvent.target, 'tr') as HTMLTableRowElement;
		const targetElement: HTMLTableRowElement = element ? element : this.dragStartRow;
		(this.destGrid.rowDragAndDropModule as any).setBorder(targetElement, args.originalEvent.event, this.dragStartRow, element);
	}

	public destRowDrop(args: any) {
		(this.destGrid as any).toolTipObj.close();
		const row = this.destGrid.element.querySelectorAll('.e-dragborder');
		for (let i = 0; i < row.length; i++) {
			row[i].classList.remove('e-dragborder');
		}
		const firstrow = this.destGrid.element.querySelectorAll('.e-firstrow-dragborder');
		for (let i = 0; i < firstrow.length; i++) {
			firstrow[i].classList.remove('e-firstrow-dragborder');
		}
		const targetID = args.target.closest('#' + this.destGrid.rowDropSettings.targetID);
		if (!targetID) {
			args.cancel = true;
			const selectInds = this.destGrid.getSelectedRows().map(x => parseInt(x.getAttribute('aria-rowindex'), 10));
			this.destGrid.reorderRows(selectInds, args.dropIndex);
			this.selectedIndices = [];

			for (let i = 0, len = selectInds.length; i < len; i++) {
				if (selectInds[i] < args.dropIndex) {
					this.selectedIndices.push(args.dropIndex - i);
				}
				if (selectInds[i] > args.dropIndex) {
					this.selectedIndices.push(args.dropIndex + i);
				}
			}
			this.destGrid.refresh();
		}
	}

	public destGridMouseover(args: any) {
		if (this.flag && this.destGrid.currentViewData.length > 0) {
			const row = this.destGrid.element.querySelectorAll('.e-dragborder');
			for (let i = 0; i < row.length; i++) {
				row[i].classList.remove('e-dragborder');
			}
			const elem = args.target.classList.contains('e-rowcell') ? args.target.parentElement : parentsUntil(args.target as any, 'e-row');
			if (elem && parseInt(elem.getAttribute('aria-rowindex'), 10) >= 0) {
				for (let i = 0; i < elem.childNodes.length; i++) {
					elem.childNodes[i].classList.add('e-dragborder');
				}
			}
		}
	}




  //Problem 1 -  src grid must maintain sort by code, destination, id fields when items are added or removed, but the destGrid must allow self drag/drop to allow user to sort items in desired order, items must still be allowed to be moved between grids via drag/drop and double clicking.  I am unclear on how to enable drag/drop between the grids and self drag/drop within the destGrid 

}