import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { faPlusSquare } from '@fortawesome/free-regular-svg-icons';

import { Package } from '../core/services/packages.service';
import { DomainService } from '../core/services/domain.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    faSyncAlt = faSyncAlt;
    faPlusSquare = faPlusSquare;

    packages: Package[] = [];
    selectedPackage: Package;
    isGithubRateLimited: boolean;

    constructor(
        private router: Router,
        private domainService: DomainService) { }

    ngOnInit(): void {
        this.domainService.getPackages()
            .then((packages: Package[]) => {
                this.packages = [];
                packages.forEach(p => {
                    this.packages.push(p);
                });

                if (this.packages.length > 0) {
                    let selected = this.packages.find(x => x.isSelected);

                    if (!selected) {
                        selected = this.packages[0];
                        selected.isSelected = true;
                    }

                    this.selectedPackage = selected;
                    this.domainService.analysePackages(this.packages)
                        .catch((err: HttpErrorResponse) => {
                            this.analyseHttpError(err);
                        });
                }
            })
            .catch(err => {
                console.error(err);
            });
    }

    selectPackage(p: Package): boolean {
        this.packages.forEach(p => {
            p.isSelected = false;
        });

        const selected = this.packages.find(x => x.id === p.id);
        selected.isSelected = true;
        this.selectedPackage = selected;

        return false;
    }

    refresh(): boolean {
        this.isGithubRateLimited = false;
        this.domainService.analysePackages(this.packages)
            .catch((err: HttpErrorResponse) => {
                this.analyseHttpError(err);
            });
        return false;
    }

    private analyseHttpError(err: HttpErrorResponse){
        this.isGithubRateLimited = err.error.message.includes('API rate limit exceeded');
    }
}
