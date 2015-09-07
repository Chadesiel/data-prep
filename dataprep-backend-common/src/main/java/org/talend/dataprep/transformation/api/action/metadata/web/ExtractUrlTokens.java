package org.talend.dataprep.transformation.api.action.metadata.web;

import static org.talend.dataprep.api.type.Type.STRING;

import java.awt.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.api.action.context.TransformationContext;
import org.talend.dataprep.transformation.api.action.metadata.category.ActionCategory;
import org.talend.dataprep.transformation.api.action.metadata.common.AbstractActionMetadata;
import org.talend.dataprep.transformation.api.action.metadata.common.ActionMetadata;
import org.talend.dataprep.transformation.api.action.metadata.common.ColumnAction;

/**
 * Split a cell value on a separator.
 */
@Component(ExtractUrlTokens.ACTION_BEAN_PREFIX + ExtractUrlTokens.EXTRACT_URL_TOKENS_ACTION_NAME)
public class ExtractUrlTokens extends AbstractActionMetadata implements ColumnAction {

    /**
     * The action name.
     */
    public static final String EXTRACT_URL_TOKENS_ACTION_NAME = "extract_url_tokens"; //$NON-NLS-1$

    private interface UrlTokenExtractor {

        String getSuffix();

        String extract(URL url);

        default Type getType() {
            return Type.STRING;
        }

        ;
    }

    private static UrlTokenExtractor[] urlTokenExtractors = new UrlTokenExtractor[]{new UrlTokenExtractor() {

        @Override
        public String getSuffix() {
            return "_protocol";
        }

        @Override
        public String extract(URL url) {
            return url.getProtocol();
        }
    }, new UrlTokenExtractor() {

        @Override
        public String getSuffix() {
            return "_host";
        }

        @Override
        public String extract(URL url) {
            return url.getHost();
        }
    }, new UrlTokenExtractor() {

        @Override
        public String getSuffix() {
            return "_port";
        }

        @Override
        public String extract(URL url) {
            final int port = url.getPort();
            return (port == -1 ? "" : port + "");
        }

        @Override
        public Type getType() {
            return Type.INTEGER;
        }
    }};

    /**
     * Private constructor to ensure IoC use.
     */
    protected ExtractUrlTokens() {
    }

    /**
     * @see ActionMetadata#getName()
     */
    @Override
    public String getName() {
        return EXTRACT_URL_TOKENS_ACTION_NAME;
    }

    /**
     * @see ActionMetadata#getCategory()
     */
    @Override
    public String getCategory() {
        return ActionCategory.QUICKFIX.getDisplayName();
    }

    /**
     * @see ActionMetadata#acceptColumn(ColumnMetadata)
     */
    @Override
    public boolean acceptColumn(ColumnMetadata column) {
        return STRING.equals(Type.get(column.getType())) && StringUtils.equalsIgnoreCase("url", column.getDomain());
    }

    /**
     * @see ColumnAction#applyOnColumn(DataSetRow, TransformationContext, Map, String)
     */
    @Override
    public void applyOnColumn(DataSetRow row, TransformationContext context, Map<String, String> parameters, String columnId) {
        final String originalValue = row.get(columnId);
        final RowMetadata rowMetadata = row.getRowMetadata();
        final ColumnMetadata column = rowMetadata.getById(columnId);

        ColumnMetadata columnToInsertAfter = column;

        try {
            URL url = (originalValue == null ? null : new URL(originalValue));

            for (UrlTokenExtractor urlTokenExtractor : urlTokenExtractors) {

                final ColumnMetadata newColumnMetadata = createNewColumn(column, urlTokenExtractor.getSuffix(), urlTokenExtractor.getType());
                final String local = rowMetadata.insertAfter(columnToInsertAfter.getId(), newColumnMetadata);
                final String tokenValue = (url == null ? "" : urlTokenExtractor.extract(url));

                row.set(local, tokenValue);

                columnToInsertAfter = newColumnMetadata;
            }
        } catch (MalformedURLException e) {
            // Nothing to do, silently skip this row
        }
    }

    /**
     * Create a new "local" column
     *
     * @param column the current column
     * @return the new column
     */
    private ColumnMetadata createNewColumn(final ColumnMetadata column, String suffix, Type type) {
        return ColumnMetadata.Builder //
                .column() //
                .name(column.getName() + suffix) //
                .type(type) //
                .headerSize(column.getHeaderSize()) //
                .build();
    }

}
