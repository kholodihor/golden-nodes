import { BaseNodeExecutor, ExecutionContext } from "../executor-registry";
import { NodeType } from "@/types";

export class EmailNodeExecutor extends BaseNodeExecutor {
  type = "EMAIL" as NodeType;
  name = "Email Node";
  description = "Sends email notifications";

  async execute(
    nodeData: any,
    inputData: any,
    context: ExecutionContext,
  ): Promise<any> {
    this.log(context, "Executing email node");

    const { to, subject, body, from } = nodeData;

    try {
      // Replace variables in email fields using Handlebars
      const emailData = {
        to: this.replaceVariables(to || "{{trigger.data.email}}", inputData),
        subject: this.replaceVariables(
          subject || "Workflow Notification",
          inputData,
        ),
        body: this.replaceVariables(
          body ||
            "Hello {{trigger.data.name}},\n\nYour workflow has completed.",
          inputData,
        ),
        from: this.replaceVariables(
          from || "noreply@yourdomain.com",
          inputData,
        ),
      };

      // TODO: Implement actual email sending logic here
      // For now, we'll simulate sending an email
      this.log(context, `Sending email to: ${emailData.to}`);
      this.log(context, `Subject: ${emailData.subject}`);

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = {
        emailSent: true,
        timestamp: new Date().toISOString(),
        emailData,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      this.log(
        context,
        `Email sent successfully with message ID: ${result.messageId}`,
      );

      return result;
    } catch (error) {
      this.log(
        context,
        `Email sending failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
      throw new Error(
        `Email sending failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  validate(nodeData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!nodeData.to && !nodeData.from) {
      errors.push("At least 'to' or 'from' field must be specified");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  getSchema(): any {
    return {
      type: "object",
      properties: {
        to: {
          type: "string",
          title: "To Email",
          description: "Recipient email address (use {{variable}} syntax)",
        },
        subject: {
          type: "string",
          title: "Subject",
          description: "Email subject line",
        },
        body: {
          type: "string",
          title: "Email Body",
          description: "Email content (supports Handlebars templating)",
        },
        from: {
          type: "string",
          title: "From Email",
          description: "Sender email address",
        },
      },
    };
  }
}
