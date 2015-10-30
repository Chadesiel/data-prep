package org.talend.dataprep.transformation.api.action.metadata.datablending;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 *
 */
@SpringBootApplication
@ComponentScan(basePackages = "org.talend.dataprep")
public class LookupTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(LookupTestApplication.class, args);
    }

}
