import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-productDetail',
  templateUrl: './productDetail.component.html',
  styleUrls: ['./productDetail.component.css']
})
export class ProductDetailComponent implements OnInit {

  constructor(
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
    private activated: ActivatedRoute,
    private router: Router
  ) {}

  productList: any = {};
  imageUrls: SafeResourceUrl[] = [];
  productTypeList: any = [];
  productImgList: any;
  cartQuantity: number = 1;
  selectedImageUrl: SafeResourceUrl | null = null;

  ngOnInit() {
    this.getProductTypeAll();

    const productId = this.activated.snapshot.paramMap.get("productId");

    this.callService.getProductByProductId(productId).subscribe((res) => {
      if (res.data) {
        this.productList = res.data;

        this.callService.getProductImgByProductId(productId).subscribe((imgRes) => {
          if (imgRes.data) {
            imgRes.data.forEach((img: any) => {
              this.getImage(img.productImgName);
            });
          } else {
            window.location.reload();
          }
        });
      } else {
        window.location.reload();
      }
    });
  }

  getImage(fileName: string) {
    this.callService.getBlobThumbnail(fileName).subscribe((res) => {
      const objectURL = URL.createObjectURL(res);
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      this.imageUrls.push(safeUrl);
    });
  }

  getProductTypeAll() {
    this.callService.getProductTypeAll().subscribe((res) => {
      if (res.data) {
        this.productTypeList = res.data;
      }
    });
  }

  getProductTypeName(productTypeId: number): string {
    const productType = this.productTypeList.find((type: any) => type.productTypeId === productTypeId);
    return productType ? productType.productTypeName : 'ไม่มีข้อมูล';
  }

  addToCart(productId: any) {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      alert('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าในตะกร้า');
      return;
    }

    const cartRequest = {
      userId: +userId,
      productId: productId,
      cartQuantity: this.cartQuantity
    };

    this.callService.saveCart(cartRequest).subscribe(
      (response) => {
        console.log('บันทึกลงตะกร้าเรียบร้อย', response);
        alert('เพิ่มสินค้าในตะกร้าเรียบร้อย');
      },
      (error) => {
        console.error('เกิดข้อผิดพลาดในการบันทึกลงตะกร้า', error);
        alert('เกิดข้อผิดพลาดในการเพิ่มสินค้าในตะกร้า');
      }
    );
  }

  updateCartQuantity(change: number) {
    const updatedQuantity = this.cartQuantity + change;

    if (updatedQuantity < 1 || updatedQuantity > this.productList.quantity) {
      return;
    }

    this.cartQuantity = updatedQuantity; 
  }

  selectImage(imageUrl: SafeResourceUrl) {
    this.selectedImageUrl = imageUrl;
  }

  onOrder
    (productId: any) {
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        alert('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าในตะกร้า');
        return;
      }
  
      const cartRequest = {
        userId: +userId,
        productId: productId,
        cartQuantity: this.cartQuantity
      };
  
      this.callService.saveCart(cartRequest).subscribe(
        (response) => {
          this.router.navigate(['/cart']);
        },
        (error) => {
          console.error('เกิดข้อผิดพลาดในการบันทึกลงตะกร้า', error);
          alert('เกิดข้อผิดพลาดในการเพิ่มสินค้าในตะกร้า');
        }
      );
    }
  }

