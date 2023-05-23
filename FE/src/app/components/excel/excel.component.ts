import { Component, OnInit } from '@angular/core';
import { ExcelService } from 'src/app/service/excel.service';
import {saveAs} from "file-saver";

@Component({
  selector: 'app-excel',
  templateUrl: './excel.component.html',
  styleUrls: ['./excel.component.css']
})
export class ExcelComponent implements OnInit{
  
  constructor(private excelService: ExcelService) { }

  generatePersonXlsx() {
    this.excelService.generatePersonXlsx().subscribe(data => {
      saveAs(data, "persons.xlsx");
    });
  }

  generateCarXlsx() {
    this.excelService.generateCarXlsx().subscribe(data => {
      saveAs(data, "cars.xlsx");
    });
  }

  generatePointXlsx() {
    this.excelService.generatePointXlsx().subscribe(data => {
      saveAs(data, "points.xlsx");
    });
  }
  
  ngOnInit(): void {
    console.log("ON In It EXCEL");
  }
}
