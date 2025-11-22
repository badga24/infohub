import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const bootstrapSwagger = (app: any) => {
    const config = new DocumentBuilder()
        .setTitle('API')
        .setDescription('API documentation with OpenAPI 3.1')
        .setVersion('1.0')
        .build();


    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
}