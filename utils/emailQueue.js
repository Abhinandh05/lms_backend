class EmailQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.emailsSentToday = new Map();
        this.dailyLimit = 10;
    }

    canSendEmail(email) {
        const today = new Date().toDateString();
        const key = `${email}-${today}`;
        const count = this.emailsSentToday.get(key) || 0;
        return count < this.dailyLimit;
    }

    incrementEmailCount(email) {
        const today = new Date().toDateString();
        const key = `${email}-${today}`;
        const count = this.emailsSentToday.get(key) || 0;
        this.emailsSentToday.set(key, count + 1);
    }

    async addToQueue(mailOptions) {
        if (!this.canSendEmail(mailOptions.to)) {
            throw new Error("Daily email limit reached for this recipient");
        }

        return new Promise((resolve, reject) => {
            this.queue.push({ mailOptions, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;

        while (this.queue.length > 0) {
            const { mailOptions, resolve, reject } = this.queue.shift();

            try {
                await new Promise((r) => setTimeout(r, 1000)); // 1 second delay
                // Import transporter when needed
                const { default: transporter } = await import("../config/nodemailer.js");
                const info = await transporter.sendMail(mailOptions);
                this.incrementEmailCount(mailOptions.to);
                resolve(info);
            } catch (error) {
                reject(error);
            }
        }

        this.processing = false;
    }

    cleanup() {
        for (const [key] of this.emailsSentToday) {
            if (!key.includes(new Date().toDateString())) {
                this.emailsSentToday.delete(key);
            }
        }
    }
}

export const emailQueue = new EmailQueue();
setInterval(() => emailQueue.cleanup(), 24 * 60 * 60 * 1000);
