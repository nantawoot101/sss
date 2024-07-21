import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  constructor(
    private callService: CallserviceService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }

  productTypeList: any;
  selectedFiles: File[] = [];
  isSubmit: boolean = false;

  ngOnInit() {
    this.getProductTypeAll();
  }

  productForm = this.formBuilder.group({
    productName: '',
    productDesc: '',
    price: '0.00',
    quantity: 0,
    productTypeId: '',
    file: [], 
    productId: '',
    author: '',
    pubLisher: '',
  });

  getProductTypeAll() {
    this.callService.getProductTypeAll().subscribe((res) => {
      if (res.data) {
        this.productTypeList = res.data;
      }
    });
  }

  onSubmit() {
    this.isSubmit = true;
    if (this.validator()) {
      const data = this.productForm.value;
      this.callService.saveProduct(data).subscribe(res => {
        if (res.data) {
          if (this.selectedFiles.length > 0) {
            this.uploadImages(res.data);
          } else {
            this.handleSuccess();
          }
        } else {
          this.handleError();
        }
      }, error => {
        this.handleError();
      });
    }
  }

  uploadImages(productId: number) {
    const formData = new FormData();
    for (const file of this.selectedFiles) {
      formData.append('file', file, file.name);
    }
    this.callService.saveImage(formData, productId).subscribe(res => {
      this.handleSuccess();
    }, error => {
      this.handleError();
    });
  }

  handleSuccess() {
    Swal.fire({
      icon: 'success',
      title: 'สำเร็จ!',
      text: 'บันทึกข้อมูลสำเร็จ',
      confirmButtonText: 'ตกลง',
    }).then(res => {
      if (res.isConfirmed) {
        this.router.navigate(['/manage-product']);
      }
    });
  }

  handleError() {
    Swal.fire({
      icon: 'warning',
      title: 'บันทึกไม่สำเร็จ!',
      text: 'กรุณาตรวจสอบข้อมูล',
      confirmButtonText: 'ตกลง',
    });
  }

  setDataDecimal(data : any){
    this.productForm.patchValue({
      price : parseFloat(data).toFixed(2),
    })
  }

  fixDecimals(){
    let value = this.productForm.value.price
    return this.setDataDecimal(value);
  }


  onFileChanged(event: any) {
    this.selectedFiles = event.target.files;
  }

  validator() {
    return this.productForm.valid;
  }

  setSubmit() {
    this.isSubmit = false;
  }
}
