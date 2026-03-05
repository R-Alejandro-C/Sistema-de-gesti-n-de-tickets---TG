import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Ticket } from '../tickets/entities/ticket.entity';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter;

    constructor() {
        // En producción las credenciales deberían venir de process.env
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.SMTP_PORT || '587'),
            auth: {
                user: process.env.SMTP_USER || 'test@ethereal.email',
                pass: process.env.SMTP_PASS || 'password',
            },
        });
    }

    async sendTicketResolvedEmail(ticket: Ticket) {
        try {
            // Obtenemos el correo del solicitante
            const destinatario = ticket.creador?.email;
            if (!destinatario) {
                this.logger.warn(`No se pudo enviar correo de resolución para ticket #${ticket.id_ticket} - Solicitante sin correo`);
                return;
            }

            const subject = `El Ticket #${ticket.id_ticket} ha sido resuelto: ${ticket.categoria?.nombre || 'General'}`;
            const htmlNode = this.renderEmailTemplate(ticket);

            const info = await this.transporter.sendMail({
                from: '"Soporte Técnico" <soporte@shadow-opportunity.local>',
                to: destinatario,
                subject: subject,
                html: htmlNode,
            });

            this.logger.log(`Correo de resolución enviado a ${destinatario} para ticket #${ticket.id_ticket} (MessageId: ${info.messageId})`);
        } catch (error) {
            this.logger.error(`Error enviando correo para ticket #${ticket.id_ticket}: ${error.message}`);
        }
    }

    private renderEmailTemplate(ticket: Ticket): string {
        const url = process.env.FRONTEND_URL || 'http://localhost:5173';
        const link = `${url}/tickets`;

        return `
            <div style="font-family: Arial, sans-serif; max-w-md: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                <h2 style="color: #4F46E5;">Ticket Resolvido</h2>
                <p>Hola <strong>${ticket.creador?.nombre || 'Usuario'}</strong>,</p>
                
                <p>Nos complace informarte que tu ticket con ID <strong>#${ticket.id_ticket}</strong> ha sido marcado como resuelto.</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 10px 0;"><strong>Detalles del Requerimiento:</strong></p>
                    <p style="margin: 0; font-style: italic; color: #475569;">"${ticket.detalle}"</p>
                    
                    <p style="margin: 15px 0 5px 0;"><strong>Solución Implementada:</strong></p>
                    <p style="margin: 0; color: #047857;">${ticket.solucion_detalle || 'Incidente resuelto por el técnico asignado.'}</p>
                </div>

                <p style="font-size: 14px; margin-bottom: 5px;"><strong>Responsable:</strong> ${ticket.asignado?.nombre || 'Equipo de Soporte'}</p>
                <p style="font-size: 14px; margin-top: 0;"><strong>Fecha de Resolución:</strong> ${new Date().toLocaleString()}</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${link}" style="background-color: #4F46E5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Ver mi Ticket</a>
                </div>
                
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px;">
                    Este es un correo automático, por favor no responda a este mensaje.<br>
                    Shadow Opportunity Help Desk
                </p>
            </div>
        `;
    }
}
