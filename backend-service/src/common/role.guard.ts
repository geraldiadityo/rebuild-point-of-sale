import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_KEY } from "./role.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY,[
            context.getHandler(),
            context.getClass()
        ]);

        if(!requiredRoles){
            return true;
        }

        const request = context.switchToHttp().getRequest();
        
        const user = request.user || request.raw?.user;

        if(!user || !user.role){
            throw new HttpException('You dont have permission (No role found)', HttpStatus.FORBIDDEN);
        }

        const userRole = user.role.nama;
        
        const hasRequiredRole = requiredRoles.some((role) => userRole === role);

        if(hasRequiredRole){
            return true;
        }

        throw new HttpException(`You dont have permission. Required role: ${requiredRoles.join(' or ')}`, HttpStatus.FORBIDDEN);
    }
}