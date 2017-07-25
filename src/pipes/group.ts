import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupFilter'
})
@Injectable()
export class GroupPipe implements PipeTransform {
  // GroupPipe
  // Filtrer par nom de groupe
  transform(groups: any[], search: string): any {
    if (!groups) {
      return;
    } else if (!search) {
      return groups;
    } else {
      let term = search.toLowerCase();
      return groups.filter(group => group.name.toLowerCase().indexOf(term) > -1);
    }
  }
}
