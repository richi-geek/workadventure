import * as aws from "@pulumi/aws";

export function CreateCertificate(): aws.acm.CertificateValidation {

    const whoCertificate = new aws.acm.Certificate("whoCertificate", {
        domainName: "who.workadventure.aws.ocho.ninja",
        validationMethod: "DNS",
    });
    
    const zoneNinja = aws.route53.getZone({
        name: "aws.ocho.ninja",
        privateZone: false,
    });
    
    const certValidation = new aws.route53.Record("certValidation", {
        name: whoCertificate.domainValidationOptions[0].resourceRecordName,
        records: [whoCertificate.domainValidationOptions[0].resourceRecordValue],
        ttl: 60,
        type: whoCertificate.domainValidationOptions[0].resourceRecordType,
        zoneId: zoneNinja.then(x => x.zoneId),
    });
    
    const certCertificateValidation = new aws.acm.CertificateValidation("cert", {
        certificateArn: whoCertificate.arn,
        validationRecordFqdns: [certValidation.fqdn],
    });

    return certCertificateValidation;
}