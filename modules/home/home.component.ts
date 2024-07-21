import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  imageBlobUrl: any;
  imageBlobUrls: any = [];
  productImgList: any;
  productList: any = [];
  productTypeList: any = [];
  paginatedProductList: any = [];

  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;
  totalPagesArray: number[] = [];

  constructor(
    private callService: CallserviceService,
    private domSanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getProductTypeAll();
    this.callService.getAllProduct().subscribe(res => {
      if (res.data) {
        this.productList = res.data;
        for (let product of this.productList) {
          product.imgList = [];
          product.productType = this.productTypeList.filter(
            (x: any) => x.productTypeId == product.productTypeId
          );
          if (null == product.productType[0]) {
            window.location.reload();
          }

          // แก้ไขการดึงรูปภาพ
          this.callService.getProductImgByProductId(product.productId).subscribe(res => {
            if (res.data) {
              this.productImgList = res.data;
              for (let productImg of this.productImgList) {
                this.getImage(productImg.productImgName, product.imgList, product.productId);
              }
            } else {
              window.location.reload();
            }
          });
        }
        this.setPagination();
      }
    });
  }

  getImage(fileName: string, imgList: SafeResourceUrl[], productId: string) {
    this.callService.getBlobThumbnail(fileName).subscribe(
      (res) => {
        let objectURL = URL.createObjectURL(res);
        const safeUrl: SafeResourceUrl = this.domSanitizer.bypassSecurityTrustUrl(objectURL);
        imgList.push(safeUrl);  
        sessionStorage.setItem(productId, objectURL); // เก็บรูปภาพใน sessionStorage
      },
      (error) => {
        console.error('รูปภาพไม่โหลด', error);
      }
    );
  }

  getProductTypeAll() {
    this.callService.getProductTypeAll().subscribe(res => {
      if (res.data) {
        this.productTypeList = res.data;
      }
    });
  }

  onProductDetail(productId: any) {
    this.router.navigate(['/productDetail/' + productId]);
  }

  addToCart(product: any) {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      alert('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าในตะกร้า');
      return;
    }

    const cartRequest = {
      userId: +userId,
      productId: product.productId,
      cartQuantity: 1  
    };

    this.callService.saveCart(cartRequest).subscribe(
      (response) => {
        console.log('บันทึกลงตะกร้าเรียบร้อย', response);
        Swal.fire('สำเร็จ', 'เพิ่มสินค้าในตะกร้าเรียบร้อย', 'success');
      },
      (error) => {
        console.error('เกิดข้อผิดพลาดในการบันทึกลงตะกร้า', error);
        Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเพิ่มสินค้าในตะกร้า', 'error');
      }
    );
  }

  setPagination() {
    this.totalPages = Math.ceil(this.productList.length / this.itemsPerPage);
    this.totalPagesArray = Array(this.totalPages).fill(0).map((x, i) => i + 1);
    this.paginateProducts();
  }

  paginateProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProductList = this.productList.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.paginateProducts();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateProducts();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateProducts();
    }
  }
}
