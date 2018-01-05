// ============================================================================
//
// Copyright (C) 2006-2018 Talend Inc. - www.talend.com
//
// This source code is available under agreement available at
// https://github.com/Talend/data-prep/blob/master/LICENSE
//
// You should have received a copy of the agreement
// along with this program; if not, write to Talend SA
// 9 rue Pages 92150 Suresnes, France
//
// ============================================================================
package org.talend.dataprep.transformation.actions.math;

import static org.talend.daikon.number.BigDecimalParser.toBigDecimal;
import static org.talend.dataprep.transformation.actions.math.Negate.NEGATE_NAME;

import org.talend.dataprep.api.action.Action;
import org.talend.dataprep.transformation.api.action.context.ActionContext;

/**
 * Create a new column with negate value
 */
@Action(NEGATE_NAME)
public class Negate extends AbstractMathNoParameterAction {

    protected static final String NEGATE_NAME = "negate_numbers";

    @Override
    protected String calculateResult(String columnValue, ActionContext context) {
        return toBigDecimal(columnValue).negate().toString();
    }

    protected String getSuffix(ActionContext context) {
        return "_negate";
    }

    @Override
    public String getName() {
        return NEGATE_NAME;
    }

}
