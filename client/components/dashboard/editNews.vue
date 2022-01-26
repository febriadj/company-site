<template>
  <div :class="[$style['edit-news'], editNews.isOpen && $style.active]">
    <div :class="[$style['edit-news-wrap'], editNews.isOpen && $style.active]">
      <div :class="$style.header">
        <h2 :class="$style.title">Edit Pengumuman</h2>
        <button
          type="button"
          :class="$style.btn"
          class="bx bx-x"
          @click="handleEditNewsIsOpen"
        >
        </button>
      </div>
      <form method="post" :class="$style.form" @submit.prevent="handleSubmit">
        <label for="edit-subject" :class="$style.fields">
          <i class="bx bx-comment-detail" :class="$style.icon"></i>
          <input
            type="subject"
            name="subject"
            id="edit-subject"
            :class="$style.control"
            placeholder="Subject"
            v-model="form.subject"
          >
        </label>
        <label for="file" :class="$style.fields">
          <input
            type="file"
            name="attachment"
            id="file"
            :class="[$style.control, $style['control-file']]"
            @change="handleInputFile"
          >
        </label>
        <label for="body" :class="$style.fields">
          <textarea
            name="body"
            id="body"
            :class="$style.control"
            v-model="form.body"
          >
          </textarea>
        </label>
        <div :class="$style.action">
          <button type="submit" :class="$style['submit-btn']">Edit</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';

export default {
  name: 'edit-news',
  props: {
    editNews: Object,
    handleEditNewsIsOpen: Function,
    handleGetAllNews: Function,
  },
  data: () => ({
    form: {
      subject: '',
      body: '',
      attachment: null,
      filename: '',
    },
    newsId: '',
  }),
  methods: {
    handleInputFile(event) { this.form.attachment = event.target.files },
    async handleSubmit() {
      try {
        const { form } = this;

        const request = await this.$apollo.mutate({
          mutation: gql`
            mutation ($newsId: String!, $subject: String, $shortDesc: String!, $body: String, $attachment: Upload, $filename: String) {
              UpdateNews (newsId: $newsId, subject: $subject, shortDesc: $shortDesc, body: $body, attachment: $attachment, filename: $filename) {
                success,
                message
              }
            }
          `,
          variables: {
            newsId: this.newsId,
            subject: form.subject,
            shortDesc: form.body.slice(0, 200),
            body: `${form.body.replace(/\n/g, '<br>')}<br>`,
            attachment: form.attachment && form.attachment[0],
            filename: form.filename,
          },
        });

        const { UpdateNews: result } = request.data;
        if (!result.success) throw result;
        this.handleGetNewsDetails(this.newsId);

        this.form = {
          subject: '',
          body: '',
          attachment: null,
          filename: '',
        }
        this.newsId = '';

        this.handleEditNewsIsOpen();
        setTimeout(() => this.handleGetAllNews(), 1000);
      }
      catch (error0) {
        console.log(error0.message);
      }
    },
    async handleGetNewsDetails(args) {
      try {
        const request = await this.$apollo.query({
          query: gql`
            query ($newsId: String!) {
              NewsDetails (newsId: $newsId) {
                id
                subject
                body
                attachment
              }
            }
          `,
          variables: {
            newsId: args,
          },
          fetchPolicy: 'network-only',
        });

        const { NewsDetails: result } = request.data;

        this.form = {
          subject: result.subject,
          body: `${result.body.replace(/<br>/g, '\n')}`,
          filename: result.attachment,
        };
        this.newsId = result.id;
      }
      catch (error0) {
        console.error(error0.message);
      }
    },
  },
  mounted() {
    const { data, isOpen } = this.editNews;

    if (isOpen) {
      this.handleGetNewsDetails(data);
    }
  },
}
</script>

<style module>
.edit-news {
  position: fixed;
  width: 100%; height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #22283180;
  z-index: 9;
}
.edit-news-wrap {
  background: #ffffff;
  padding: 20px;
  width: 600px; height: 450px;
  margin: 20px;
  box-shadow: 0 0 50px #22283140;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 20px;
  overflow: hidden;
  transition: cubic-bezier(0.6,-0.28,0.74,0.05) 0.3s;
  transition-delay: 0s;
}
.header {
  display: flex;
  justify-content: space-between;
  align-content: center;
}
.header .btn {
  font-size: 1.5rem;
  cursor: pointer;
}
.form {
  display: grid;
  grid-template-rows: auto auto 1fr auto;
}
.fields {
  border-bottom: 1px solid #22283180;
  padding: 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}
.fields .icon {
  font-size: 1.5rem;
}
.control {
  width: 100%;
}
.fields:nth-of-type(3) {
  border: none;
}
textarea {
  height: 100%;
}
.action {
  display: flex;
  align-items: center;
  gap: 10px;
}
.action .submit-btn {
  padding: 10px 20px;
  background: #baffd9;
  cursor: pointer;
  width: 150px;
}
.file-btn {
  font-size: 1.5rem;
  cursor: pointer;
  transform: rotate(-90deg);
  width: 40px; height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
}
.file-btn:hover {
  background: #bac4ff50;
}

@media screen and (max-width: 540px) {
  .create-news-wrap.active {
    height: 350px;
  }
}
</style>
