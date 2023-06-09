import { AwsVpcRepository } from "./repository/AwsVpcRepository";
import { CreerUnReseau } from "./usecases/CreerUnReseau";

const awsVpcRepository = new AwsVpcRepository();
CreerUnReseau(awsVpcRepository);
