import { AwsVpcRepository } from "./repository/AwsVpcRepository";
import { AwsLoadBalancerRepository } from "./repository/AwsLoadBalancerRepository";
import { AwsContainerServiceRepository } from "./repository/AwsContainerServiceRepository";
import { CreerUnReseau } from "./usecases/CreerUnReseau";
import { DeployerLoadBalancer } from "./usecases/DeployerLoadBalancer";
import { DeployerWorkAdventure } from "./usecases/DeployerWorkAdventure";


const awsVpcRepository = new AwsVpcRepository();
const awsLoadBalancerRepository = new AwsLoadBalancerRepository();
const awsContainerServiceRepository = new AwsContainerServiceRepository();

const vpc = CreerUnReseau(awsVpcRepository);
DeployerLoadBalancer(awsLoadBalancerRepository, awsVpcRepository, vpc);
DeployerWorkAdventure(awsLoadBalancerRepository, awsVpcRepository, awsContainerServiceRepository);
