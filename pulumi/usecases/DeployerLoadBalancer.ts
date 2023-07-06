import { LoadBalancer } from "../domain/loadbalancer/LoadBalancer";
import { TargetGroup } from "../domain/loadbalancer/TargetGroup";
import { Listener, ListenerDefaultAction } from "../domain/loadbalancer/Listener";
import { Vpc } from "../domain/vpc/vpc";
import { ILoadBalancerRepository } from "../repository/ILoadBalancerRepository";
import { IVpcRepository } from "../repository/IVpcRepository";
import { Certificate } from "../domain/loadbalancer/Certificate";

/**
 * Use case qui déploie WorkAdventure dans un vpc donné
 * @param vpcRepository le repository à utiliser pour le deploiement
 * @param sss l'objet métier VPC qui contient l'infrastructure nécessaire pour heberger WorkAdventure
 */
export function DeployerLoadBalancer(loadBalancerRepository: ILoadBalancerRepository, vpcRepository: IVpcRepository, vpc: Vpc) {
    const loadBalancer = new LoadBalancer("loadbalancer-workadventure", "application");
    
    // On récupère le security group par défaut pour notre load balancer
    const securityGroup = vpc.getSecurityGroups().find(sg => sg.getName() === "default-sg");
    if (securityGroup != null) {
        loadBalancer.addSecurityGroup(securityGroup);
    }

    // On récupère les subnets publics du VPC (2 dans ce cas)
    const subnets = vpc.getSubnets().filter(subnet => subnet.isPublic())
    subnets.forEach(subnet => loadBalancer.addSubnet(subnet));

    const traefikTargetGroup = new TargetGroup("traefik-target-group", 80, "HTTP", vpc, "ip", {matcher: "200-202,404", path: "/"});
    const traefikAPITargetGroup = new TargetGroup("traefikAPI-target-group", 8080, "HTTP", vpc, "ip", {matcher: "200-202,300-302", path: "/"});
    
    /** Pour tester si l'app marhce bien sans traefik */
    // const waTargetGroup = new TargetGroup("wa-target-group", 3000, "HTTP", vpc, "ip", {matcher: "200-202", path: "/"});
    // const waListener = new Listener("wa-listener", loadBalancer, 3000, "HTTP", {
    //     type: "forward",
    //     targetGroup: waTargetGroup
    // });

    const traefikListener = new Listener("traefik-listener", loadBalancer, 80, "HTTP", {
        type: "redirect",
        redirect: {
            port: "443",
            protocol: "HTTPS",
            statusCode: "HTTP_301",
        }
    });

    const traefikAPIListener = new Listener("traefikAPI-listener", loadBalancer, 8080, "HTTP", {
        type: "forward",
        targetGroup: traefikAPITargetGroup
    });

    // Problematique car on peut associer une seule validation au listener
    // TODO : voir si on peut valider plusieurs certificats dans une validation
    const certificate = new Certificate("*.workadventure.aws.ocho.ninja", "DNS");
    const httpsListener = new Listener("https-listener", loadBalancer, 443, "HTTPS", {
        type: "forward",
        targetGroup: traefikTargetGroup
    });
    httpsListener.addCertificate(certificate);

    loadBalancerRepository.deploy(
        vpcRepository,
        [loadBalancer], 
        [traefikTargetGroup, traefikAPITargetGroup], 
        [traefikListener, traefikAPIListener, httpsListener]
    );
}