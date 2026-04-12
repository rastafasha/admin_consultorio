import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

const base_url = environment.url_media;

@Pipe({
  name: 'imagenPipe',
  standalone: false,
})
export class ImagenPipe implements PipeTransform {

  transform(avatar: string, tipo: 'staffs'|'publicidad'|'patients'|'payments' ): string {

    if(!avatar){
      return `./assets/img/user-06.jpg`;
    } else if(avatar.includes('https')){
      return avatar;
    } else if(avatar){
      return `${avatar}`;
      // return `${tipo}/${avatar}`;
      // return `${base_url}/${avatar}`;
      // return `${base_url}/${tipo}/${avatar}`;
    }else {
      return `${base_url}no-image.png`;
    }


  }

}
