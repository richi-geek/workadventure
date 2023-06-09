import { Vpc } from "../domain/vpc/vpc";

export interface VpcRepository { 
    deploy(vpc: Vpc): void
}